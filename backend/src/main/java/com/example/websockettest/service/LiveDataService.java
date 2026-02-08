package com.example.websockettest.service;

import com.example.websockettest.dto.LiveDataMessage;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class LiveDataService {

    public static final String LIVE_DATA_TOPIC = "/topic/live-data";

    private final SimpMessagingTemplate messagingTemplate;

    public LiveDataService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @Scheduled(fixedRate = 1000)
    public void broadcastLiveData() {
        double value = ThreadLocalRandom.current().nextDouble(90, 100);
        LiveDataMessage message = new LiveDataMessage(value, Instant.now());
        messagingTemplate.convertAndSend(LIVE_DATA_TOPIC, message);
    }
}
