package com.shanti.store.marketplace.entity;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.shanti.store.marketplace.constants.UserEntityConstants;
import com.shanti.store.marketplace.enums.UserStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = UserEntityConstants.TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true, exclude = {"roles", "addresses", "cart", "verification", "deliveryPartner", "sellerAccount"})

@SuppressWarnings("serial")
public class User extends BaseEntity {

	@Column(name = UserEntityConstants.COL_USERNAME, nullable = false, length = UserEntityConstants.LENGTH_USERNAME)
	private String username;

	@Column(name = UserEntityConstants.COL_EMAIL, nullable = false, unique = true, length = UserEntityConstants.LENGTH_EMAIL)
	private String email;

	@Column(name = UserEntityConstants.COL_PASSWORD, nullable = false)
	private String password;

	@Column(name = UserEntityConstants.COL_FIRST_NAME)
	private String firstName;

	@Column(name = UserEntityConstants.COL_LAST_NAME)
	private String lastName;
	
	@OneToMany(mappedBy = UserEntityConstants.MAPPED_BY_ADDRESSES, cascade = CascadeType.ALL, orphanRemoval = true)
	@ToString.Exclude
	@Builder.Default	
	private List<Address> addresses = new ArrayList<>();
	
	@ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_role",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    @ToString.Exclude    
    private Set<Role> roles = new HashSet<>();
	
	@OneToOne(mappedBy = UserEntityConstants.MAPPED_BY_SELLER, cascade = CascadeType.ALL, orphanRemoval = true)
	@ToString.Exclude	
	private SellerAccount sellerAccount;

    @OneToOne(mappedBy = UserEntityConstants.MAPPED_BY_CART, cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private Cart cart;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "userStatus", nullable = false)
    private UserStatus userStatus;
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    @ToString.Exclude    
    private UserVerification verification;
    
    @Builder.Default
    @Column(nullable = false)
    private boolean accountLocked = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean accountExpired = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean credentialsExpired = false;
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    @ToString.Exclude    
    private DeliveryPartner deliveryPartner;

}
