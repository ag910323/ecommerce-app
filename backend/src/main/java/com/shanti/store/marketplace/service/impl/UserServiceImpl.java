package com.shanti.store.marketplace.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shanti.store.marketplace.dto.EmailDetails;
import com.shanti.store.marketplace.entity.Address;
import com.shanti.store.marketplace.entity.Cart;
import com.shanti.store.marketplace.entity.DeliveryPartner;
import com.shanti.store.marketplace.entity.DeliveryPartnerDocument;
import com.shanti.store.marketplace.entity.DeliveryPartnerProfile;
import com.shanti.store.marketplace.entity.Role;
import com.shanti.store.marketplace.entity.SellerAccount;
import com.shanti.store.marketplace.entity.SellerAddress;
import com.shanti.store.marketplace.entity.SellerBankDetail;
import com.shanti.store.marketplace.entity.SellerContact;
import com.shanti.store.marketplace.entity.SellerDocument;
import com.shanti.store.marketplace.entity.SellerProfile;
import com.shanti.store.marketplace.entity.User;
import com.shanti.store.marketplace.entity.UserVerification;
import com.shanti.store.marketplace.enums.DocumentType;
import com.shanti.store.marketplace.enums.RoleType;
import com.shanti.store.marketplace.enums.SellerStatus;
import com.shanti.store.marketplace.enums.UserStatus;
import com.shanti.store.marketplace.enums.VerificationStatus;
import com.shanti.store.marketplace.exception.EntityNotFoundException;
import com.shanti.store.marketplace.exception.VerificationException;
import com.shanti.store.marketplace.mapper.UserMapper;
import com.shanti.store.marketplace.repository.RoleRepository;
import com.shanti.store.marketplace.repository.UserRepository;
import com.shanti.store.marketplace.request.AddressRequest;
import com.shanti.store.marketplace.request.DeliveryPartnerRequest;
import com.shanti.store.marketplace.request.LoginRequest;
import com.shanti.store.marketplace.request.UserRegistrationRequest;
import com.shanti.store.marketplace.request.VerifyRequest;
import com.shanti.store.marketplace.response.LoginResponse;
import com.shanti.store.marketplace.response.UserResponse;
import com.shanti.store.marketplace.security.util.JwtUtil;
import com.shanti.store.marketplace.service.EmailService;
import com.shanti.store.marketplace.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

	private final UserRepository userRepository;
	private final RoleRepository roleRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtUtil jwtUtil;
	private final AuthenticationManager authenticationManager;
	private final EmailService emailService;

	@Override
	@Transactional
	public LoginResponse login(LoginRequest request) {
		
		
		Authentication authentication = authenticationManager
				.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
		SecurityContextHolder.getContext().setAuthentication(authentication);

		UserDetails userDetails = (UserDetails) authentication.getPrincipal();
		String token = jwtUtil.generateToken(userDetails.getUsername());

		User user = userRepository.findByEmail(userDetails.getUsername())
				.orElseThrow(() -> new EntityNotFoundException("User not found"));

		return LoginResponse.builder().jwtToken(token).userResponse(UserMapper.toResponse(user)).build();
	}

	private String generateRandomCode() {
		return String.valueOf((int) (Math.random() * 900000) + 100000); // 6-digit OTP
	}

	@Transactional
	public void verifyUser(VerifyRequest request) {
		User user = userRepository.findByEmail(request.getEmail())
				.orElseThrow(() -> new VerificationException("User not found"));

		UserVerification verification = user.getVerification();

		if (verification == null || !verification.getVerificationCode().equals(request.getCode())) {
			throw new VerificationException("Invalid verification code");
		}

		if (verification.getExpiryDateTime().isBefore(LocalDateTime.now())) {
			throw new VerificationException("Verification code expired");
		}

		verification.setStatus(VerificationStatus.VERIFIED);
		verification.setVerifiedAt(LocalDateTime.now());
		user.setUserStatus(UserStatus.VERIFIED);

		userRepository.save(user);
	}

	@Transactional
	public void sendOtp(VerifyRequest request) {
		User user = userRepository.findByEmail(request.getEmail())
				.orElseThrow(() -> new VerificationException("User not found"));
		UserVerification verification = user.getVerification();

		if (verification.getOtpSentAt() != null
				&& verification.getOtpSentAt().isAfter(LocalDateTime.now().minusMinutes(2))) {
			throw new VerificationException("Please wait before requesting a new OTP");
		}

		String newOtp = generateRandomCode();
		verification.setVerificationCode(newOtp);
		verification.setOtpSentAt(LocalDateTime.now());
		verification.setExpiryDateTime(LocalDateTime.now().plusMinutes(10)); // OTP valid 10 mins
		verification.setStatus(VerificationStatus.PENDING);

		userRepository.save(user);

		EmailDetails otpEmail = EmailDetails.builder().to(user.getEmail()).subject("Your OTP Code")
				.body("Your OTP is " + newOtp + ". It is valid for 10 minutes.").isHtml(false).build();

		emailService.sendEmail(otpEmail);

	}

	/**
	 * ✅ Generic Registration Method Handles ANY number of roles (CUSTOMER, SELLER,
	 * ADMIN, SUPPORT, DELIVERY_PARTNER, etc.)
	 */
	@Override
	@Transactional
	public UserResponse registerUserWithRoles(UserRegistrationRequest request) {
		User savedUser = null;
		List<RoleType> roleTypes = request.getRoles() != null ? request.getRoles() : List.of();
		User existingUser = userRepository.findByEmail(request.getEmail()).orElse(null);

		Set<Role> requestedRoles = roleTypes.stream()
				.map(rt -> roleRepository.findByName(rt.name())
						.orElseThrow(() -> new EntityNotFoundException("Role " + rt + " not found")))
				.collect(Collectors.toSet());

		User user;
		if (existingUser == null) {
			user = createNewUser(request, requestedRoles);
		} else {
			throw new RuntimeException("User Already exists with EmailId " + request.getEmail());
//			user = updateExistingUser(existingUser, requestedRoles);
		}

		for (RoleType rt : roleTypes) {
			switch (rt) {
			case SELLER -> setupSellerProfile(user, request);
			case DELIVERY_PARTNER -> setupDeliveryPartnerProfile(user, request);
			case ADMIN, SUPPORT -> {
				// Additional role-specific setups can go here
			}
			default -> {
			}
			}
		}

		savedUser = userRepository.save(user);
		return UserMapper.toResponse(savedUser);
	}

	private void setupDeliveryPartnerProfile(User user, UserRegistrationRequest request) {
		if (user.getDeliveryPartner() != null)
			return;

		DeliveryPartnerRequest dpRequest = request.getDeliveryPartner();
		if (dpRequest == null)
			return;

		DeliveryPartner dp = DeliveryPartner.builder().user(user).status(VerificationStatus.PENDING).build();

		DeliveryPartnerProfile profile = DeliveryPartnerProfile.builder().deliveryPartner(dp)
				.fullName(dpRequest.getFullName()).vehicleType(dpRequest.getVehicleType())
				.vehicleNumber(dpRequest.getVehicleNumber()).build();

		if (dpRequest.getDocuments() != null) {
			dpRequest.getDocuments().forEach(
					d -> profile.getDocuments().add(DeliveryPartnerDocument.builder().deliveryPartnerProfile(profile)
							.documentType(d.getDocumentType()).documentUrl(d.getDocumentUrl()).build()));
		}

		dp.setProfile(profile);
		user.setDeliveryPartner(dp);
	}

	private User createNewUser(UserRegistrationRequest request, Set<Role> requestedRoles) {
		User user = User.builder().username(request.getUsername()).email(request.getEmail())
				.password(passwordEncoder.encode(request.getPassword())).firstName(request.getFirstName())
				.lastName(request.getLastName()).userStatus(UserStatus.PENDING_VERIFICATION).roles(requestedRoles)
				.build();

		if (hasCustomerRole(requestedRoles)) {
			setupCart(user);
		}
		setupAddresses(user, request.getUserAddresses());
		setupVerification(user);
		return user;
	}
	
	private void setupAddresses(User user, List<AddressRequest> addresses) {
	    if (addresses == null || addresses.isEmpty()) return;

	    addresses.forEach(req -> {
	        Address address = Address.builder()
	                .street(req.getStreet())
	                .city(req.getCity())
	                .state(req.getState())
	                .country(req.getCountry())
	                .zipCode(req.getZipCode())
	                .user(user)
	                .build();
	        user.getAddresses().add(address);
	    });
	}

	private User updateExistingUser(User existingUser, Set<Role> requestedRoles) {
		requestedRoles.forEach(role -> {
			if (!existingUser.getRoles().contains(role)) {
				existingUser.getRoles().add(role);
			}
		});

		if (hasCustomerRole(existingUser.getRoles())) {
			setupCart(existingUser);
		}

		return existingUser;
	}

	private boolean hasCustomerRole(Set<Role> roles) {
		return roles.stream().anyMatch(r -> r.getName().equals(RoleType.CUSTOMER.name()));
	}

	private void setupCart(User user) {
		if (user.getCart() == null) {
			Cart cart = Cart.builder().user(user).build();
			user.setCart(cart);
		}
	}

	private void setupVerification(User user) {
		UserVerification verification = UserVerification.builder().user(user).status(VerificationStatus.PENDING)
				.verificationCode(generateRandomCode()).expiryDateTime(LocalDateTime.now().plusHours(12)).build();
		user.setVerification(verification);
	}

	private void setupSellerProfile(User user, UserRegistrationRequest request) {
		if (user.getSellerAccount() != null)
			return; // Already has seller profile

		SellerAccount sellerAccount = SellerAccount.builder().name(request.getBusinessName()).status(SellerStatus.PENDING_VERIFICATION)
				.user(user).build();

		SellerProfile profile = SellerProfile.builder().sellerAccount(sellerAccount).businessName(request.getBusinessName())
				.gstNumber(request.getGstNumber())
				.registrationDate(
						request.getRegistrationDate() != null ? request.getRegistrationDate() : LocalDate.now())
				.build();

		if (request.getContacts() != null) {
			request.getContacts()
					.forEach(c -> profile.getContacts()
							.add(SellerContact.builder().sellerProfile(profile).phone(c.getPhone()).email(c.getEmail())
									.alternatePhone(c.getAlternatePhone()).supportContact(c.getSupportContact())
									.build()));
		}

		if (request.getAddresses() != null) {
			request.getAddresses().forEach(a -> profile.getAddresses()
					.add(SellerAddress.builder().sellerProfile(profile).addressLine1(a.getAddressLine1())
							.addressLine2(a.getAddressLine2()).city(a.getCity()).state(a.getState())
							.country(a.getCountry()).zipCode(a.getZipCode()).isWarehouse(a.getIsWarehouse()).build()));
		}

		if (request.getBankDetails() != null) {
			request.getBankDetails()
					.forEach(b -> profile.getBankDetails()
							.add(SellerBankDetail.builder().sellerProfile(profile).accountNumber(b.getAccountNumber())
									.accountType(b.getAccountType()).ifscCode(b.getIfscCode()).bankName(b.getBankName())
									.build()));
		}

		if (request.getDocuments() != null) {
			request.getDocuments()
					.forEach(d -> profile.getDocuments()
							.add(SellerDocument.builder().sellerProfile(profile).documentType(DocumentType.valueOf(d.getDocumentType()))
									.documentUrl(d.getDocumentUrl()).remarks(d.getRemarks()).build()));
		}

		sellerAccount.setSellerProfile(profile);
		user.setSellerAccount(sellerAccount);
	}
	
	@Override
	public void deleteUser(Long userId) {
	    userRepository.deleteById(userId);
	}
	
	@Override
	public boolean existsByEmail(String email) {
	    return userRepository.existsByEmail(email);
	}

	@Override
	public boolean existsByUsername(String username) {
	    return userRepository.existsByUsername(username);
	}

}
