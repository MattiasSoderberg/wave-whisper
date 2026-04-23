package se.salt.matte.backend.domain.services;

import be.tarsos.dsp.AudioDispatcher;
import be.tarsos.dsp.AudioEvent;
import be.tarsos.dsp.AudioProcessor;
import be.tarsos.dsp.io.TarsosDSPAudioFormat;
import be.tarsos.dsp.io.jvm.AudioDispatcherFactory;
import be.tarsos.dsp.synthesis.SineGenerator;
import be.tarsos.dsp.util.fft.FFT;
import be.tarsos.dsp.writer.WaveHeader;
import jakarta.annotation.PostConstruct;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Service;
import se.salt.matte.backend.config.AudioProperties;

import javax.sound.sampled.AudioFormat;
import javax.sound.sampled.UnsupportedAudioFileException;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@Service
public class AudioSteganographyService {

    private static final Map<Character, Integer> CHAR_TO_FREQ = new HashMap<>();

    private final AudioProperties audioProperties;

    public AudioSteganographyService(AudioProperties audioProperties) {
        this.audioProperties = audioProperties;
    }

    @PostConstruct
    public void init() {
        String allowedChars = audioProperties.getAllowedChars();
        final int startFreq = audioProperties.getStartFreq();
        final int step = audioProperties.getFreqStep();

        for (int i = 0; i < allowedChars.length(); i++) {
            int freq = startFreq + (i * step);
            CHAR_TO_FREQ.put(allowedChars.charAt(i), freq);
        }
    }

    public byte[] encode(String text) {
        TarsosDSPAudioFormat format = new TarsosDSPAudioFormat(
                audioProperties.getSampleRate(),
                audioProperties.getBitsPerSample(),
                audioProperties.getChannels(),
                true,
                false
        );

        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try (baos) {

            WaveHeader header = getWaveHeader(text);
            header.write(baos);

            for (char c : text.toCharArray()) {
                Integer freq = CHAR_TO_FREQ.getOrDefault(c, audioProperties.getStartFreq());

                if (freq == null) {
                    continue;
                }

                final SineGenerator generator = new SineGenerator(
                        audioProperties.getGain(),
                        freq);

                for (int i = 0; i < audioProperties.getEventsPerLetter(); i++) {
                    AudioEvent audioEvent = new AudioEvent(format);
                    audioEvent.setFloatBuffer(new float[audioProperties.getBufferSize()]);
                    generator.process(audioEvent);
                    baos.write(audioEvent.getByteBuffer());
                }
            }

            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    public String decode(byte[] wavData) {
        AudioFormat format = new AudioFormat(
                audioProperties.getSampleRate(),
                audioProperties.getBitsPerSample(),
                audioProperties.getChannels(),
                true,
                false
        );
        StringBuilder result = new StringBuilder();

        try {
            AudioDispatcher dispatcher = AudioDispatcherFactory.fromByteArray(wavData, format, audioProperties.getBufferSize(), 0);

            final int[] eventCount = {0};
            final float[] binEnergies = new float[audioProperties.getBufferSize() / 2];

            dispatcher.addAudioProcessor(new AudioProcessor() {
                final FFT fft = new FFT(audioProperties.getBufferSize());
                final int overhead = 100;
                final int freq_limit = audioProperties.getStartFreq() + (audioProperties.getAllowedChars().length() * audioProperties.getFreqStep()) + overhead;

                @Override
                public boolean process(AudioEvent audioEvent) {
                    float[] buffer = audioEvent.getFloatBuffer();
                    float[] amplitudes = new float[audioProperties.getBufferSize() / 2];

                    fft.forwardTransform(buffer);
                    fft.modulus(buffer, amplitudes);

                    for (int i = 0; i < amplitudes.length; i++) {
                        binEnergies[i] += amplitudes[i];
                    }

                    eventCount[0]++;

                    if (eventCount[0] >= audioProperties.getEventsPerLetter()) {
                        int maxBin = -1;
                        float maxAmp = -1;

                        int startBin = (int) Math.floor((double) audioProperties.getStartFreq() * audioProperties.getBufferSize() / audioProperties.getSampleRate());
                        int endBin = (int) Math.ceil((double) freq_limit * audioProperties.getBufferSize() / audioProperties.getSampleRate());

                        for (int i = startBin; i < endBin; i++) {
                            if (binEnergies[i] > maxAmp) {
                                maxAmp = binEnergies[i];
                                maxBin = i;
                            }
                        }

                        if (maxBin != -1 && maxAmp > audioProperties.getGainThreshold()) {
                            double detectedFreq = fft.binToHz(maxBin, audioProperties.getSampleRate());
                            if (detectedFreq >= audioProperties.getStartFreq() + 150) {

                                char foundChar = findClosestChar(detectedFreq);
                                result.append(foundChar);
                            }
                        }

                        eventCount[0] = 0;
                        Arrays.fill(binEnergies, 0);
                    }

                    return true;
                }

                @Override
                public void processingFinished() {

                }
            });

            dispatcher.run();
            return result.toString();
        } catch (UnsupportedAudioFileException e) {
            throw new RuntimeException("Unsupported audio format: " + e.getMessage());
        }
    }

    private @NonNull WaveHeader getWaveHeader(String text) {
        int bytesPerSample = audioProperties.getBitsPerSample() / Byte.SIZE;
        int totalPcmSize = text.length() * audioProperties.getEventsPerLetter() * audioProperties.getBufferSize() * bytesPerSample;

        return new WaveHeader(
                WaveHeader.FORMAT_PCM,
                (short) audioProperties.getChannels(),
                audioProperties.getSampleRate(),
                (short) audioProperties.getBitsPerSample(),
                totalPcmSize);
    }

    private char findClosestChar(double freq) {
        char closest = '?';
        double minDiff = Double.MAX_VALUE;

        for (Map.Entry<Character, Integer> entry : CHAR_TO_FREQ.entrySet()) {
            double diff = Math.abs(entry.getValue() - freq);
            if (diff < minDiff) {
                minDiff = diff;
                closest = entry.getKey();
            }
        }

        if (minDiff > audioProperties.getFreqStep() / 2.0) {
            return '?';
        }

        return closest;
    }
}
