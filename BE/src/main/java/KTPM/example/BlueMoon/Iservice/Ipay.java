package KTPM.example.BlueMoon.Iservice;

import KTPM.example.BlueMoon.model.Khoanthu;
import KTPM.example.BlueMoon.model.Pay;

import java.util.List;

public interface Ipay {
    boolean addpay(int hokhau_id, Khoanthu newkhoanthu, String tenkhoanthu);

}
