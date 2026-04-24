package se.salt.matte.backend.exception;

public class ProfileNotFoundException extends NotFoundException {
    public ProfileNotFoundException() {
        super("Profile not found");
    }
}
