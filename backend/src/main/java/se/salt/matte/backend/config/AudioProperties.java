package se.salt.matte.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "audio")
public class AudioProperties {

    private int sampleRate = 22050;
    private int bufferSize = 2048;
    private double secondsPerLetter = 0.1;
    private int bitsPerSample = 16;
    private int channels = 1;
    private float gain = 0.8f;
    private float gainThreshold = 0.5f;
    private String fileExtension = ".wav";
    private int startFreq = 8000;
    private int freqLimit = 11000;
    private int freqStep = 40;
    private String allowedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖabcdefghijklmnopqrstuvwxyzåäö0123456789!?. ";

    public int getSampleRate() {
        return sampleRate;
    }

    public void setSampleRate(int sampleRate) {
        this.sampleRate = sampleRate;
    }

    public int getBufferSize() {
        return bufferSize;
    }

    public void setBufferSize(int bufferSize) {
        this.bufferSize = bufferSize;
    }

    public double getSecondsPerLetter() {
        return secondsPerLetter;
    }

    public void setSecondsPerLetter(double secondsPerLetter) {
        this.secondsPerLetter = secondsPerLetter;
    }

    public int getEventsPerLetter() {
        int samplesPerLetter = (int) (sampleRate * secondsPerLetter);
        return samplesPerLetter / bufferSize;
    }

    public int getBitsPerSample() {
        return bitsPerSample;
    }

    public void setBitsPerSample(int bitsPerSample) {
        this.bitsPerSample = bitsPerSample;
    }

    public int getChannels() {
        return channels;
    }

    public void setChannels(int channels) {
        this.channels = channels;
    }

    public float getGain() {
        return gain;
    }

    public void setGain(float gain) {
        this.gain = gain;
    }

    public float getGainThreshold() {
        return gainThreshold;
    }

    public void setGainThreshold(float gainThreshold) {
        this.gainThreshold = gainThreshold;
    }

    public String getFileExtension() {
        return fileExtension;
    }

    public void setFileExtension(String fileExtension) {
        this.fileExtension = fileExtension;
    }

    public int getStartFreq() {
        return startFreq;
    }

    public void setStartFreq(int startFreq) {
        this.startFreq = startFreq;
    }

    public int getFreqLimit() {
        return freqLimit;
    }

    public void setFreqLimit(int freqLimit) {
        this.freqLimit = freqLimit;
    }

    public int getFreqStep() {
        return freqStep;
    }

    public void setFreqStep(int freqStep) {
        this.freqStep = freqStep;
    }

    public String getAllowedChars() {
        return allowedChars;
    }

    public void setAllowedChars(String allowedChars) {
        this.allowedChars = allowedChars;
    }
}
