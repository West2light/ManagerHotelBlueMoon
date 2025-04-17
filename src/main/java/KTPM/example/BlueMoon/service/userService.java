package KTPM.example.BlueMoon.service;

import KTPM.example.BlueMoon.Iservice.Iuser;
import KTPM.example.BlueMoon.model.User;
import KTPM.example.BlueMoon.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class userService implements Iuser {

    @Autowired
    private UserRepository userRepository;

    @Override
    public boolean login(String username, String password) {
        User user = userRepository.findByUsername(username);
        if(user.getPassword().equals(password)) {
            return true;
        }
        return false;
    }
}
