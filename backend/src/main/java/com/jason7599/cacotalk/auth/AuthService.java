package com.jason7599.cacotalk.auth;

import com.jason7599.cacotalk.auth.dto.AuthUserResponse;
import com.jason7599.cacotalk.auth.dto.LoginRequest;
import com.jason7599.cacotalk.auth.dto.RegisterRequest;
import com.jason7599.cacotalk.auth.session.SessionService;
import com.jason7599.cacotalk.exceptions.ApiErrorCodes;
import com.jason7599.cacotalk.exceptions.ApiException;
import com.jason7599.cacotalk.user.UserEntity;
import com.jason7599.cacotalk.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SessionService sessionService;

    // returns raw token, since we want automatic login after register
    @Transactional
    public String register(RegisterRequest request) {
        // TODO: potential race condition?
        //  It's still guarded by the database UNIQUE so worst case it delivers an internal server error
        if (userRepository.existsByUsername(request.username())) {
            throw new ApiException(ApiErrorCodes.USERNAME_TAKEN);
        }

        UserEntity user = userRepository.save(
                new UserEntity(
                        request.username(),
                        passwordEncoder.encode(request.password())
                )
        );

        return sessionService.create(user.getId());
    }

    // returns raw token
    public String login(LoginRequest request) {
        UserEntity user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new ApiException(ApiErrorCodes.BAD_CREDENTIALS));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(ApiErrorCodes.BAD_CREDENTIALS);
        }

        return sessionService.create(user.getId());
    }

    public AuthUserResponse getAuthUser(long userId) {
        return new AuthUserResponse(userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ApiErrorCodes.USER_NOT_FOUND))
        );
    }

    public void logout(String token) {
        sessionService.delete(token);
    }
}
