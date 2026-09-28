package com.vigilsense.aspect;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class MetricsAspect {

    private final MeterRegistry meterRegistry;

    public MetricsAspect(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    @Around("execution(* com.vigilsense..service..*(..))")
    public Object recordServiceMetrics(ProceedingJoinPoint joinPoint) throws Throwable {
        String className = joinPoint.getSignature().getDeclaringType().getSimpleName();
        String methodName = joinPoint.getSignature().getName();

        Timer timer = meterRegistry.timer("vigilsense.service.calls", "class", className, "method", methodName);
        
        return timer.recordCallable(() -> {
            try {
                return joinPoint.proceed();
            } catch (Throwable e) {
                meterRegistry.counter("vigilsense.service.errors", "class", className, "method", methodName).increment();
                if (e instanceof RuntimeException) {
                    throw (RuntimeException) e;
                }
                throw new RuntimeException(e);
            }
        });
    }
}
