package se.salt.matte.backend.domain.services;

import be.tarsos.dsp.AudioEvent;
import be.tarsos.dsp.io.TarsosDSPAudioFormat;
import be.tarsos.dsp.synthesis.SineGenerator;
import be.tarsos.dsp.writer.WaveHeader;
import jakarta.annotation.PostConstruct;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Service;
import se.salt.matte.backend.config.AudioProperties;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class AudioSteganographyService {

    private static final Map<Character, Integer> CHAR_TO_FREQ = new HashMap<>();
    private static final Map<Integer, Character> FREQ_TO_CHAR = new HashMap<>();

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
            FREQ_TO_CHAR.put(freq, allowedChars.charAt(i));
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
}
