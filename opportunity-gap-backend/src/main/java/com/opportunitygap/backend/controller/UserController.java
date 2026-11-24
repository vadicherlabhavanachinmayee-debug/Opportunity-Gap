
package com.opportunitygap.backend.controller;

import com.opportunitygap.backend.entity.User;
import com.opportunitygap.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            String name = request.get("name");
            String email = request.get("email");
            String password = request.get("password");

            if (name == null || name.isBlank()
                    || email == null || email.isBlank()
                    || password == null || password.length() < 8) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message",
                                "Enter your name, email and a password of at least 8 characters."));
            }

            User user = userService.register(
                    name.trim(),
                    email.trim().toLowerCase(),
                    password
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Registration successful",
                    "userId", user.getUserId(),
                    "name", user.getName(),
                    "email", user.getEmail()
            ));

        } catch (RuntimeException exception) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", exception.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");

            if (email == null || email.isBlank()
                    || password == null || password.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Email and password are required."));
            }

            User user = userService.login(
                    email.trim().toLowerCase(),
                    password
            );

            return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "userId", user.getUserId(),
                    "name", user.getName(),
                    "email", user.getEmail()
            ));

        } catch (RuntimeException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", exception.getMessage()));
        }
    }
}
