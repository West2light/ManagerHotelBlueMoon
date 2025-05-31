package KTPM.example.BlueMoon.Iservice;

import KTPM.example.BlueMoon.model.Khoanthu;

import java.util.Date;

public interface Ipay {
    boolean addpay(int nhankhauId, Khoanthu kt, Date ngaythu, String nguoinop, Float soTien);
}