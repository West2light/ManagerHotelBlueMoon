package KTPM.example.BlueMoon.controller;

import KTPM.example.BlueMoon.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

import static KTPM.example.BlueMoon.config.GenToken.generateToken;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
//@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class LoginController {

    private final AccountService accountService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String username = request.get("username");
            String password = request.get("password");

            if (accountService.login(username, password)) {
                String token = generateToken(username, password);
                response.put("token", token);
                response.put("status", "success");
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "fail");
                return ResponseEntity.status(401).body(response);
            }
        } catch (Exception e) {
                response.put("message", e.getMessage());
                return ResponseEntity.status(500).body(response);
        }
    }
}
