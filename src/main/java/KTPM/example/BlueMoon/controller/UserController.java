package KTPM.example.BlueMoon.controller;

import KTPM.example.BlueMoon.repository.UserRepository;
import KTPM.example.BlueMoon.service.userService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserController {

    private final userService userService;

    private final UserRepository userRepository;
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String username = request.get("username");
            String password = request.get("password");

            if (userService.login(username, password)) {
                response.put("roleid", userRepository.findByUsername(username).getRole().getRolename());
                response.put("status", "success");
                response.put("userid", userRepository.findByUsername(username).getId());
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
    
    @PostMapping("/register") //chỉ tổ trưởng
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String username = request.get("username");
            String password = request.get("password");
            int roleid = Integer.parseInt(request.get("roleid"));

            if (userService.register(username, password, roleid)) {
                response.put("status", "success");
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "fail");
                return ResponseEntity.status(400).body(response);
            }
        } catch (Exception e) {
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/changePassword")
    public ResponseEntity<Map<String, Object>> changePassword(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String username = request.get("username");
            String password = request.get("password");

            if (userService.changePassword(username, password)) {
                response.put("status", "success");
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "fail");
                return ResponseEntity.status(400).body(response);
            }
        } catch (Exception e) {
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/deleteUser") //chỉ tổ trưởng
    public ResponseEntity<Map<String, Object>> deleteUser(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String username = request.get("username");

            if (userService.deleteUser(username)) {
                response.put("status", "success");
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "fail");
                return ResponseEntity.status(400).body(response);
            }
        } catch (Exception e) {
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/getAccounts") //chỉ tổ trưởng
    public ResponseEntity<Map<String, Object>> getAccounts() {
        Map<String, Object> response = new HashMap<>();
        try {
            response.put("status", "success");
            response.put("accounts", userService.getAccounts());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

}
