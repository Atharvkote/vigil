package com.vigilsense.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {

    private static final Logger log = LoggerFactory.getLogger(LoggingAspect.class);

    @Around("execution(* com.vigilsense..service..*(..))")
    public Object logServiceExecution(ProceedingJoinPoint joinPoint) throws Throwable {
        String method = joinPoint.getSignature().toShortString();
        log.info("Starting {}", method);

        try {
            Object result = joinPoint.proceed();
            log.info("Completed {}", method);
            return result;
        } catch (Exception ex) {
            log.error("Failed {}: {}", method, ex.getMessage());
            throw ex;
        }
    }
}
