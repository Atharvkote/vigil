package com.vigilsense.weather.client;

import java.math.BigDecimal;

import com.vigilsense.weather.dto.FetchedObservation;

public interface WeatherClient {

    FetchedObservation fetch(BigDecimal latitude, BigDecimal longitude);
}
