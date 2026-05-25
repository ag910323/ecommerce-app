package com.shanti.store.marketplace.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shanti.store.marketplace.entity.Brand;
import com.shanti.store.marketplace.entity.BrandPartnership;
import com.shanti.store.marketplace.entity.BrandPartnership.PartnershipStatus;
import com.shanti.store.marketplace.entity.BrandPartnershipType;
import com.shanti.store.marketplace.entity.Product;
import com.shanti.store.marketplace.mapper.BrandMapper;
import com.shanti.store.marketplace.repository.BrandPartnershipRepository;
import com.shanti.store.marketplace.repository.BrandPartnershipTypeRepository;
import com.shanti.store.marketplace.repository.BrandRepository;
import com.shanti.store.marketplace.repository.ProductRepository;
import com.shanti.store.marketplace.request.BrandPartnershipRequest;
import com.shanti.store.marketplace.response.BrandResponse;
import com.shanti.store.marketplace.response.PagedResponse;
import com.shanti.store.marketplace.response.ProductResponse;
import com.shanti.store.marketplace.service.BrandPartnershipService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BrandPartnershipServiceImpl implements BrandPartnershipService {
	
	private final BrandPartnershipRepository partnershipRepository;
	private final BrandPartnershipTypeRepository partnershipTypeRepository;
    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;
    
    @Override
    @Transactional
    public BrandPartnership createPartnership(Long brandId, Long partnershipTypeId, 
                                            BrandPartnershipRequest request) throws Exception {
        Brand brand = brandRepository.findById(brandId)
            .orElseThrow(() -> new Exception("Brand not found"));
            
        BrandPartnershipType type = partnershipTypeRepository.findById(partnershipTypeId)
            .orElseThrow(() -> new Exception("Partnership type not found"));
        
        // Check for existing active partnership
        if (partnershipRepository.existsByBrandIdAndStatus(brandId, PartnershipStatus.ACTIVE)) {
            throw new Exception("Brand already has an active partnership");
        }
        
        BrandPartnership partnership = BrandPartnership.builder()
            .brand(brand)
            .partnershipType(type)
            .startDate(request.getStartDate())
            .endDate(request.getEndDate())
            .monthlyFee(type.getMonthlyFee())
            .contractTerms(request.getContractTerms())
            .specialBenefits(request.getSpecialBenefits())
            .status(PartnershipStatus.PENDING)
            .build();
            
        return partnershipRepository.save(partnership);
    }
    
    @Override
    @Transactional
    public void activatePartnership(Long partnershipId) throws Exception {
        BrandPartnership partnership = partnershipRepository.findById(partnershipId)
            .orElseThrow(() -> new Exception("Partnership not found"));
            
        partnership.setStatus(PartnershipStatus.ACTIVE);
        partnershipRepository.save(partnership);
        
        // Update brand partnership level
        Brand brand = partnership.getBrand();
        BrandPartnershipType type = partnership.getPartnershipType();
        
        brand.setPartnershipLevel(mapToPartnershipLevel(type.getName()));
        brand.setPartnershipBadge(type.getDisplayName());
        brand.setPartnershipPriority(type.getPriorityBoost());
        
        brandRepository.save(brand);
        
        updateBrandProductsWithPartnership(brand.getId(), type);
    }
    
    @Override
    public PagedResponse<ProductResponse> getProductsWithBrandPartnership(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productRepository.findProductsWithBrandPartnershipPriority(pageable);
        
        List<ProductResponse> content = products.getContent().stream()
                .map(product -> {
                    ProductResponse response = new ProductResponse();
                    response.setId(product.getId());
                    response.setName(product.getName());
                    response.setDescription(product.getDescription());
                    response.setPrice(product.getPrice());
                    response.setBrandName(product.getBrand() != null ? product.getBrand().getName() : null);
                    // Add partnership or sponsorship info if needed
                    return response;
                })
                .toList();
        return new PagedResponse<>(
                content,
                products.getNumber(),
                products.getSize(),
                products.getTotalElements()
        );
    }
    
    @Override
    public List<BrandResponse> getPartnerBrands(int limit) {
        List<Brand> brands = brandRepository.findActivePartnerBrands(PageRequest.of(0, limit));
        return brands.stream()
            .map(BrandMapper::toResponse)
            .toList();
    }
    
    private void updateBrandProductsWithPartnership(Long brandId, BrandPartnershipType type) {
        List<Product> products = productRepository.findByBrandIdAndActiveTrue(brandId);
        
        products.forEach(product -> {
            product.setPartnershipBadge(type.getDisplayName());
            product.setPartnershipPriority(type.getPriorityBoost());
            product.setBrandPartnershipLevel(mapToPartnershipLevel(type.getName()));
        });
        
        productRepository.saveAll(products);
    }
    
    
    private Brand.PartnershipLevel mapToPartnershipLevel(String typeName) {
        return switch (typeName) {
            case "BRAND_PARTNER" -> Brand.PartnershipLevel.PARTNER;
            case "FEATURED_BRAND" -> Brand.PartnershipLevel.FEATURED;
            case "TOP_BRAND" -> Brand.PartnershipLevel.TOP;
            case "EXCLUSIVE_PARTNER" -> Brand.PartnershipLevel.EXCLUSIVE;
            default -> Brand.PartnershipLevel.NONE;
        };
    }
    
    @Override
	@Transactional
	public void expireOldPartnerships() {
		List<BrandPartnership> expired = partnershipRepository.findAllByEndDateBeforeAndStatusNot(LocalDateTime.now(),
				PartnershipStatus.EXPIRED);
		expired.forEach(p -> p.setStatus(PartnershipStatus.EXPIRED));
		partnershipRepository.saveAll(expired);
	}
	

}
