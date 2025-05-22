package KTPM.example.BlueMoon.service;

import KTPM.example.BlueMoon.Iservice.Iuser;
import KTPM.example.BlueMoon.model.Role;
import KTPM.example.BlueMoon.model.User;
import KTPM.example.BlueMoon.repository.RoleRepository;
import KTPM.example.BlueMoon.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class userService implements Iuser {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public boolean login(String username, String password) {
        User user = userRepository.findByUsername(username);
        if(user != null && user.getPassword().equals(password) && user.isEnabled() == true) {
            return true;
        }
        return false;
    }

    @Override
    public boolean register(String username, String password, int roleid) {
        if(username != null && password != null && roleid != 0) {
            Role role = roleRepository.findByRoleid(roleid);
            User user = User.builder()
                    .username(username)
                    .password(password)
                    .role(role)
                    .enabled(true)
                    .build();
            userRepository.save(user);
            return true;
        }
        return false;
    }

    @Override
    public boolean changePassword(int userid, String password) {
        User user = userRepository.findById(userid);
        if(user != null) {
            user.setPassword(password);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    @Override
    public boolean deleteUser(String username) {
        User user = userRepository.findByUsername(username);
        if(user != null) {
            user.setEnabled(false);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    @Override
    public List<Map<String, Object>> getAccounts() {
        List<User> users = userRepository.findByRoleRolename("Kế toán");
        if (users == null) {
            return null;
        }
        List<Map<String, Object>> accounts = new ArrayList<>();
        for (User user : users) {
            Map<String, Object> account = Map.of(
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "password", user.getPassword(),
                    "role", user.getRole().getRolename(),
                    "enabled", user.isEnabled()
            );
            accounts.add(account);
        }
        return accounts;
    }
}
