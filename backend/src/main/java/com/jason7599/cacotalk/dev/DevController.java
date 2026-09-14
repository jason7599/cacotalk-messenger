package com.jason7599.cacotalk.dev;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@Profile("dev")
@RequestMapping("/dev")
@RequiredArgsConstructor
public class DevController {

    private final DevDataService dataService;

    @PostMapping("/seed/users")
    public String seedUsers(@RequestParam(defaultValue = "100") int count) {
        long total = dataService.seedUsers(count);
        return "Total users: %d".formatted(total);
    }

    @PostMapping("/seed/contacts")
    public String seedContacts(@RequestParam(defaultValue = "0.2") double ratio) {
        int count = dataService.seedContacts(ratio);
        return "Seeded %d contacts".formatted(count);
    }

    @PostMapping("/seed/conversations/{conversationId}/messages")
    public String seedMessages(
            @PathVariable UUID conversationId,
            @RequestParam(defaultValue = "100") int count
    ) {
        long total = dataService.seedMessages(conversationId, count);
        return "Total messages: %d".formatted(total);
    }

    @PostMapping("/data/nuke")
    public String nuke() {
        dataService.nuke();
        return "OK";
    }
}
