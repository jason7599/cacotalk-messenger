package com.jason7599.cacotalk.dev;

import net.datafaker.Faker;

import java.util.List;
import java.util.Locale;
import java.util.Random;
import java.util.function.Supplier;

public class UsernameFaker {

    private static final Faker faker = new Faker(Locale.US);
    private static final Random random = new Random();

    private static final List<Supplier<String>> WORD_PROVIDERS = List.of(
            () -> faker.hacker().noun(),
            () -> faker.hacker().adjective(),
            () -> faker.animal().name(),
            () -> faker.color().name(),
            () -> faker.space().planet(),
            () -> faker.name().firstName(),
            () -> faker.name().lastName(),
            () -> faker.dog().name(),
            () -> faker.cat().name(),
            () -> faker.food().ingredient(),
            () -> faker.lorem().word()
    );

    public static String generate() {
        String word1 = randomWord();
        String word2 = randomWord();
        int number = faker.number().numberBetween(1, 10_000);

        String username = switch (random.nextInt(4)) {
            case 0 -> word1 + word2;
            case 1 -> word1 + number;
            case 2 -> word1 + word2 + number;
            default -> word1 + number + word2;
        };

        username = sanitize(username);

        if (username.length() > 32) {
            username = username.substring(0, 32);
        } else if (username.length() < 3) {
            username += faker.number().digits(3 - username.length());
        }

        return username;
    }

    private static String randomWord() {
        return sanitize(
                WORD_PROVIDERS
                        .get(random.nextInt(WORD_PROVIDERS.size()))
                        .get()
        );
    }

    private static String sanitize(String value) {
        return value
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]", "");
    }
}