package com.slowind.chunchunhee.domain.design.controller;

import com.slowind.chunchunhee.domain.design.entity.Design;
import com.slowind.chunchunhee.domain.design.service.DesignService;
import com.slowind.chunchunhee.global.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/designs")
public class ApiV1DesignController {
    private final DesignService designService;

    // --- inner 클래스 다건조회 응답
    @Getter
    @AllArgsConstructor
    public static class DesignsResponse {
        private final List<DesignDto> designs;
    }

    @Getter
    @AllArgsConstructor
    public static class DesignDto {
        private final Long id;
        private final Long memberSerial;
        private final Long productSerial;
        private final String username;
        private final String title;
        private final String designTitle;
        private final String designDescription;
        private final String designCategory;
    }
    // --- 다건 조회
    @GetMapping("")
    public DesignsResponse getDesigns(
            @RequestParam(value = "userSerial", required = false) Long userSerial,
            @RequestParam(value = "category", required = false) String category
    ) {
        List<Design> designs = designService.getList(userSerial, category);

        List<DesignDto> items = designs.stream()
                .map(d -> new DesignDto(
                        d.getId(),
                        d.getMember().getId(),
                        d.getProduct().getId(),
                        d.getMember().getUsername(),
                        d.getProduct().getTitle(),
                        d.getDesignTitle(),
                        d.getDesignDescription(),
                        d.getProduct().getCategory()
                ))
                .toList();

        return new DesignsResponse(items);
    }

    // --- inner 클래스 단건조회 응답
    @Getter
    @AllArgsConstructor
    public static class DesignResponse {
        private final Design design;
    }

    // --- 단건 조회
    @GetMapping("{id}")
    public DesignDto getDesign(@PathVariable("id") Long id){
        Design d = designService.getDesign(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "%d번 디자인은 존재하지 않습니다.".formatted(id)
                ));

        return new DesignDto(
                d.getId(),
                d.getMember().getId(),
                d.getProduct().getId(),
                d.getMember().getUsername(),
                d.getProduct().getTitle(),
                d.getDesignTitle(),
                d.getDesignDescription(),
                d.getProduct().getCategory()
        );
    }

    // --- inner 클래스 - 디자인 생성 요청
    @Data
    public static class NewDesignRequest {
        @NotNull
        private Long memberSerial;

        @NotNull
        private Long productSerial;

        @NotNull
        private String username;

        @NotNull
        private String title;

        @NotBlank
        private String designTitle;

        @NotBlank
        private String designDescription;

        @NotBlank
        private String designCategory;
    }

    // --- inner 클래스 - 디자인 생성 응답
    @Getter
    @AllArgsConstructor
    public static class NewDesignResponse {
        private final Design design;
    }
    // --- 디자인 생성
    @PostMapping("")
    public NewDesignResponse newDesign(@Valid @RequestBody NewDesignRequest newDesignRequest){
        Design design = designService.create(
                                newDesignRequest.getMemberSerial(),
                                newDesignRequest.getProductSerial(),
                                newDesignRequest.getDesignTitle(),
                                newDesignRequest.getDesignDescription(),
                                newDesignRequest.getDesignCategory()
                            );

        return new NewDesignResponse(design);
    }

    // --- inner 클래스 - 디자인 수정 요청
    @Data
    public static class ModifyDesignRequest {
        @NotNull
        private Long memberSerial;

        @NotNull
        private Long productSerial;

        @NotBlank
        private String designTitle;

        @NotBlank
        private String designDescription;

        @NotBlank
        private String designCategory;
    }

    // --- inner 클래스 - 디자인 수정 응답
    @Getter
    @AllArgsConstructor
    public static class ModifyDesignResponse {
        private final Design design;
    }

    // --- 디자인 수정
    @PatchMapping("/{id}")
    public ModifyDesignResponse modifyDesigns(@PathVariable("id") Long designId, @Valid @RequestBody ModifyDesignRequest modifyDesignRequest) {
        Design design = designService.findById(designId).orElseThrow(() -> new ResourceNotFoundException(
                "%d번 디자인은 존재하지않습니다.".formatted(designId)
        ));

        Design updateDesign = designService.update(
                design,
                modifyDesignRequest.getMemberSerial(),
                modifyDesignRequest.getProductSerial(),
                modifyDesignRequest.getDesignTitle(),
                modifyDesignRequest.getDesignDescription(),
                modifyDesignRequest.getDesignCategory());

        return new  ModifyDesignResponse(updateDesign);
    }

    // --- inner 클래스 - 디자인 삭제 응답
    @Getter
    @AllArgsConstructor
    public static class RemoveDesignResponse {
        private final Design design;
    }
    // --- 디자인 삭제
    @DeleteMapping("/{id}")
    public RemoveDesignResponse deleteDesigns(@PathVariable("id")  Long designId) {
        Design design = designService.findById(designId).orElseThrow(() -> new ResourceNotFoundException(
                "%d번 디자인은 존재하지않습니다.".formatted(designId)
        ));
        designService.delete(designId);
        return new RemoveDesignResponse(design);
    }
}
