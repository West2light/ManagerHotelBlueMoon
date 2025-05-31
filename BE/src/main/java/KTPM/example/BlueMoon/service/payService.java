package KTPM.example.BlueMoon.service;

import KTPM.example.BlueMoon.Iservice.Ipay;
import KTPM.example.BlueMoon.model.Hokhau;
import KTPM.example.BlueMoon.model.Khoanthu;
import KTPM.example.BlueMoon.model.Nhankhau;
import KTPM.example.BlueMoon.model.Pay;
import KTPM.example.BlueMoon.repository.PayRepository;
import KTPM.example.BlueMoon.repository.nhankhauRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

@Transactional
@Service
@RequiredArgsConstructor
public class payService implements Ipay {
    @Autowired private final PayRepository payRepository;
    @Autowired private final nhankhauRepository nhRepository;

    @Override
    public boolean addpay(int nhankhauId, Khoanthu kt, Date ngaythu, String nguoinop, Float soTien) {
        Nhankhau nk = nhRepository.findById(nhankhauId).orElse(null);
        if (nk == null) return false;
        if (!nk.getHoten().equalsIgnoreCase(nguoinop)) return false;
        Hokhau hokhau = nk.getHokhau();
        if (hokhau == null) return false;
        long finalTien;
        if (kt.getTinhchat() == 1) {
            if (soTien != null) return false;
            double dientich = hokhau.getDientich();
            int xeMay = hokhau.getXemay();
            int oTo   = hokhau.getOto();
            finalTien = Math.round(dientich*2500 + dientich*7000 + xeMay*70000 + oTo*1200000);
        } else if (kt.getTinhchat() == 2) {
            if (soTien == null || soTien <= 0) return false;
            finalTien = Math.round(soTien);
        } else {
            return false;
        }
        try {
            Pay newpay = Pay.builder()
                    .khoanthu(kt)
                    .nhankhau(nk)
                    .ngaythu(new java.sql.Date(ngaythu.getTime()))
                    .tien(finalTien)
                    .nguoinop(nguoinop)
                    .build();
            payRepository.save(newpay);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}