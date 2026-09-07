package com.jason7599.cacotalk.auth.session;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class SessionTokenService {

    private static final SecureRandom RANDOM = new SecureRandom();

    // generate random session token
    public String generate() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);

        // convert to text in base64
        // withoutPadding removes trailing = chars
        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);
    }

    // takes in raw token
    public String hash(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    token.getBytes(StandardCharsets.UTF_8)
            );

            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            // shouldn't happen
            throw new IllegalStateException("SHA-256 is not available", e);
        }
    }
}
