package KTPM.example.BlueMoon.repository;

import KTPM.example.BlueMoon.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    User findByUsername(String username);

    User findById(int id);

    List<User> findByRoleRolename(String customer);
}
