package KTPM.example.BlueMoon.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Table(name = "nop_tien")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Pay {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @ManyToOne
    @JoinColumn(name = "nhankhau_id")
    private nhankhau nhankhau;

    @ManyToOne
    @JoinColumn(name = "khoanthu_id")
    private khoanthu khoanthu;

    private Date ngaythu;
    private Float tien;
    private String nguoinop;
}
