package com.vigilsense.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import com.vigilsense.common.annotation.Auditable;

@Aspect
@Component
public class AuditAspect {

    private static final Logger log = LoggerFactory.getLogger(AuditAspect.class);

    @Around("@annotation(auditable)")
    public Object auditOperation(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        String action = auditable.action();
        log.info("AUDIT: Starting action '{}' in method '{}'", action, joinPoint.getSignature().toShortString());

        try {
            Object result = joinPoint.proceed();
            log.info("AUDIT: Successfully completed action '{}'", action);
            return result;
        } catch (Exception ex) {
            log.error("AUDIT: Action '{}' failed with exception: {}", action, ex.getMessage());
            throw ex;
        }
    }
}
