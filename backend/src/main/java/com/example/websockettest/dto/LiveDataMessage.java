package com.example.websockettest.dto;

import java.time.Instant;

public record LiveDataMessage(double value, Instant timestamp) {
}
