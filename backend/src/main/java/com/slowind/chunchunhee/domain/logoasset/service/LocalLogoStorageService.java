package com.slowind.chunchunhee.domain.logoasset.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LocalLogoStorageService {

    @Value("${app.upload.root:./uploads}")
    private String uploadRoot;

    private Path logosDir() {
        return Path.of(uploadRoot).toAbsolutePath().normalize().resolve("logos");
    }

    @PostConstruct
    void init() throws IOException {
        Files.createDirectories(logosDir());
    }

    /** 디스크에 저장하고 파일명만 반환 (예: uuid.png) */
    public String savePng(byte[] pngBytes) {
        String fileName = UUID.randomUUID() + ".png";
        Path target = logosDir().resolve(fileName).normalize();
        if (!target.startsWith(logosDir())) {
            throw new IllegalStateException("잘못된 저장 경로입니다.");
        }
        try {
            Files.write(target, pngBytes);
        } catch (IOException e) {
            throw new IllegalStateException("파일 저장 실패: " + e.getMessage(), e);
        }
        return fileName;
    }

    public Path resolveLogoFile(String fileName) {
        Path p = logosDir().resolve(fileName).normalize();
        if (!p.startsWith(logosDir())) {
            throw new IllegalStateException("허용되지 않은 경로입니다.");
        }
        return p;
    }
}