package KTPM.example.BlueMoon.repository;

import KTPM.example.BlueMoon.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {
    Role findById(int role);

    Role findByRoleid(int roleid);
}
