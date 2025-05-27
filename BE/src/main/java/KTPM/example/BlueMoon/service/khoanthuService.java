package KTPM.example.BlueMoon.service;

import KTPM.example.BlueMoon.Iservice.Ikhoanthu;
import KTPM.example.BlueMoon.model.Hokhau;
import KTPM.example.BlueMoon.model.Khoanthu;
import KTPM.example.BlueMoon.model.Pay;
import KTPM.example.BlueMoon.repository.PayRepository;
import KTPM.example.BlueMoon.repository.khoanthuRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Transactional
@Service
@RequiredArgsConstructor
public class khoanthuService implements Ikhoanthu {
    @Autowired
    private khoanthuRepository khoanthuRepository;
    @Autowired
    private PayRepository payRepository;

    @Override
    public Khoanthu addkhoanthu( Date thoihan, String tenkhoanthu, String ghichu, int tinhchat){
        if ( tenkhoanthu != null && tinhchat!= 0)
        {


            Khoanthu newkhoanthu = Khoanthu.builder()
                    .ghichu(ghichu)
                    .ngaytao(new Date( System.currentTimeMillis()))
                    .tenkhoanthu(tenkhoanthu)
                    .thoihan(thoihan)
                    .tinhchat(tinhchat)
                    .build();
            khoanthuRepository.save(newkhoanthu);
            return newkhoanthu;
        }
        return null;
    }

    @Override
    public boolean updatekhoanthu(int khoanthu_id, Date thoihan, String tenkhoanthu, String ghichu){
        if(khoanthu_id!=0 && tenkhoanthu != null){
            Khoanthu khoanthu = khoanthuRepository.findByKhoanthuid(khoanthu_id);
            if(khoanthu!= null){
                khoanthu.setThoihan(thoihan);
                khoanthu.setGhichu(ghichu);
                khoanthu.setTenkhoanthu(tenkhoanthu);
                khoanthuRepository.save(khoanthu);
                return true;
            }
        }
        return false;
    }

    @Override
    public boolean deletekhoanthu(int khoanthu_id){
        if(khoanthu_id!=0){
            try{
                payRepository.deleteByKhoanthu_Khoanthuid(khoanthu_id);
                khoanthuRepository.deleteByKhoanthuid(khoanthu_id);
                return true;
            } catch (Exception e){
                return false;
            }
        }
        return false;
    }

    @Override
    public List<Map<String, Object>> getListkhoanthu(){
        List<Khoanthu> khoanthus= khoanthuRepository.findAll();
        List<Map<String, Object>> listkhoanthu = new ArrayList<>();
        for (Khoanthu khoanthu : khoanthus) {
            Map<String, Object> lskhoanthu = new HashMap<>();
            lskhoanthu.put("ngaytao",khoanthu.getNgaytao());
            lskhoanthu.put("thoihan",khoanthu.getThoihan());
            lskhoanthu.put("tenkhoanthu",khoanthu.getTenkhoanthu());
            lskhoanthu.put("ghichu",khoanthu.getGhichu());
            lskhoanthu.put("tinhchat",khoanthu.getTinhchat());
            listkhoanthu.add(lskhoanthu);
        }

        return listkhoanthu;
    }
}
