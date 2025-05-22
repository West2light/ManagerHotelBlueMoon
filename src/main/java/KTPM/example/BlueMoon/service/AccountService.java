package KTPM.example.BlueMoon.service;

import KTPM.example.BlueMoon.Iservice.Iaccount;
import KTPM.example.BlueMoon.model.User;
import KTPM.example.BlueMoon.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AccountService implements Iaccount {

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
