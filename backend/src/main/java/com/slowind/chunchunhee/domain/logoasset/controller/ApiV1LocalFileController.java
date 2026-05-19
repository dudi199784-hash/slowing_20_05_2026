package com.slowind.chunchunhee.domain.logoasset.controller;

import com.slowind.chunchunhee.domain.logoasset.service.LocalLogoStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.regex.Pattern;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/files")
public class ApiV1LocalFileController {

    private static final Pattern SAFE_FILE =
            Pattern.compile("^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}\\.png$");

    private final LocalLogoStorageService localLogoStorageService;

    @GetMapping("/logos/{fileName}")
    public ResponseEntity<Resource> logo(@PathVariable String fileName) throws MalformedURLException {
        if (!SAFE_FILE.matcher(fileName).matches()) {
            throw new IllegalArgumentException("허용되지 않은 파일명입니다.");
        }
        Path path = localLogoStorageService.resolveLogoFile(fileName);
        Resource resource = new UrlResource(path.toUri());
        if (!resource.exists() || !resource.isReadable()) {
            throw new IllegalStateException("파일을 찾을 수 없습니다.");
        }
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=3600")
                .body(resource);
    }
}