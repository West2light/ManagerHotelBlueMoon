package KTPM.example.BlueMoon.Iservice;

import java.util.List;
import java.util.Map;

public interface Iuser {
    boolean login(String username, String password);

    boolean register(String username, String password, int roleid);

    boolean changePassword(String username, String password);

    boolean deleteUser(String username);

    List<Map<String,Object>> getAccounts();
}
