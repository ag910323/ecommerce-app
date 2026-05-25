package com.shanti.store.marketplace.security.util;

import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.shanti.store.marketplace.constants.AppConstants;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {
	
	@Value("${jwt.secret}")
	String jwtSecret;

	private Key getSigningKey() {
		return Keys.hmacShaKeyFor(jwtSecret.getBytes());
	}

	public String generateToken(String username) {
		return Jwts.builder().setSubject(username).setIssuedAt(new Date())
				.setExpiration(new Date(System.currentTimeMillis() + AppConstants.JWT_TOKEN_EXPIRATION)).signWith(getSigningKey())
				.compact();
	}

	public String getUsernameFromToken(String token) {
		return Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token).getBody().getSubject();
	}

	public boolean validateToken(String token) throws JwtException {
		Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
		return true;
	}
}
