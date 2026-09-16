package com.jason7599.cacotalk.dev;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import net.datafaker.Faker;

import java.util.List;
import java.util.Locale;
import java.util.Random;
import java.util.function.Supplier;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DevDataFaker {

    private static final Faker FAKER = new Faker(Locale.US);
    private static final Random RANDOM = new Random();

    private static final List<Supplier<String>> USERNAME_WORD_PROVIDERS = List.of(
            () -> FAKER.hacker().noun(),
            () -> FAKER.hacker().adjective(),
            () -> FAKER.animal().name(),
            () -> FAKER.color().name(),
            () -> FAKER.space().planet(),
            () -> FAKER.name().firstName(),
            () -> FAKER.name().lastName(),
            () -> FAKER.dog().name(),
            () -> FAKER.cat().name(),
            () -> FAKER.food().ingredient(),
            () -> FAKER.lorem().word()
    );

    public static String username() {
        String word1 = randomUsernameWord();
        String word2 = randomUsernameWord();

        int number = FAKER.number().numberBetween(1, 10_000);

        String username = switch (RANDOM.nextInt(4)) {
            case 0 -> word1 + word2;
            case 1 -> word1 + number;
            case 2 -> word1 + word2 + number;
            default -> word1 + number + word2;
        };

        username = sanitizeUsername(username);

        if (username.length() > 32) {
            username = username.substring(0, 32);
        } else if (username.length() < 3) {
            username += FAKER.number().digits(3 - username.length());
        }

        return username;
    }

    public static String message() {
        return switch (RANDOM.nextInt(5)) {
            case 0 -> FAKER.lorem().word();
            case 1 -> FAKER.lorem().sentence(3);
            case 2 -> FAKER.lorem().sentence(10);
            case 3 -> FAKER.lorem().paragraph();
            default -> FAKER.lorem().paragraph(3);
        };
    }

    private static String randomUsernameWord() {
        return sanitizeUsername(
                USERNAME_WORD_PROVIDERS
                        .get(RANDOM.nextInt(USERNAME_WORD_PROVIDERS.size()))
                        .get()
        );
    }

    private static String sanitizeUsername(String value) {
        return value
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]", "");
    }
}