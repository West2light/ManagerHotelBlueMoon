package KTPM.example.BlueMoon.service;

import KTPM.example.BlueMoon.Iservice.Ipay;
import KTPM.example.BlueMoon.model.Hokhau;
import KTPM.example.BlueMoon.model.Khoanthu;
import KTPM.example.BlueMoon.model.Pay;
import KTPM.example.BlueMoon.repository.hokhauRepository;
import KTPM.example.BlueMoon.repository.khoanthuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
@Transactional
@Service
@RequiredArgsConstructor
public class payService implements Ipay {
    @Autowired
    private KTPM.example.BlueMoon.repository.PayRepository payRepository;
    @Autowired
    private hokhauRepository hkRepository;
    @Autowired
    private khoanthuRepository ktRepository;
    @Override
    public boolean addpay(int hokhau_id, Khoanthu newkhoanthu, String tenkhoanthu){
        Hokhau hokhau= hkRepository.findByHokhauid(hokhau_id);
        Double dientich = hokhau.getDientich();
        Double tien;
        if (tenkhoanthu.equals("Phí dịch vụ")){
            tien = dientich*2500;
        } else if (tenkhoanthu.equals("Phí quản lí chung cư")) {
            tien = dientich*7000;
        } else  {
            tien = null;
        }
        try {
            Float tienF = tien.floatValue();
            if(tien!= null&& newkhoanthu!= null){
                Pay newpay = Pay.builder()
                        .khoanthu(newkhoanthu)
                        .tien(tienF)
                        .build();
                payRepository.save(newpay);
                return true;
            }
        } catch (Exception e){
            return false;
        }
        return false;
    }


}
