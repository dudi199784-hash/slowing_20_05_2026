package com.slowind.chunchunhee.global.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpClientErrorException;
import java.net.URI;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        pd.setTitle("Not Found");
        pd.setInstance(URI.create(request.getRequestURI()));
        return pd;
    }

    /** `@Valid` 검증 실패 → 400 */
    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleBadRequest(IllegalArgumentException ex, HttpServletRequest request) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
        pd.setTitle("Bad Request");
        pd.setInstance(URI.create(request.getRequestURI()));
        return pd;
    }

    @ExceptionHandler(IllegalStateException.class)
    public ProblemDetail handleIllegalState(IllegalStateException ex, HttpServletRequest request) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
        pd.setTitle("Internal Server Error");
        pd.setInstance(URI.create(request.getRequestURI()));
        return pd;
    }

    @ExceptionHandler(HttpClientErrorException.class)
    public ProblemDetail handleOpenAiClientError(HttpClientErrorException ex, HttpServletRequest request) {
        String body = ex.getResponseBodyAsString();
        if (body == null || body.isBlank()) {
            body = ex.getMessage();
        }
        String detail = openAiErrorDetail(body);
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_GATEWAY,
                detail
        );
        pd.setTitle("OpenAI Error");
        pd.setInstance(URI.create(request.getRequestURI()));
        return pd;
    }

    private static String openAiErrorDetail(String body) {
        if (body == null) {
            return "OpenAI API 오류가 발생했습니다.";
        }
        String lower = body.toLowerCase();
        if (lower.contains("billing_hard_limit")
                || lower.contains("billing hard limit")
                || lower.contains("billing_limit")
                || lower.contains("insufficient_quota")
                || lower.contains("exceeded your current quota")) {
            return "OpenAI 계정의 결제 한도에 도달했습니다. "
                    + "platform.openai.com → Billing에서 결제 수단·한도·크레딧을 확인한 뒤 다시 시도해 주세요.";
        }
        return "OpenAI API 오류: " + body;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "입력값을 확인해 주세요.");
        pd.setTitle("Bad Request");
        pd.setInstance(URI.create(request.getRequestURI()));
        Map<String, String> errors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        pd.setProperty("errors", errors);
        return pd;
    }

}
