package com.shanti.store.marketplace.security;

import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.shanti.store.marketplace.entity.User;
import com.shanti.store.marketplace.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

	private final UserRepository userRepository;

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

		Set<GrantedAuthority> authorities = user.getRoles().stream()
				.map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName())).collect(Collectors.toSet());

		return org.springframework.security.core.userdetails.User
		        .withUsername(user.getEmail())
		        .password(user.getPassword())
		        .authorities(authorities)
		        .accountExpired(user.isAccountExpired())  
		        .accountLocked(user.isAccountLocked())       
		        .credentialsExpired(user.isCredentialsExpired())
		        .disabled(!user.isActive())                   
		        .build();

	}
}
