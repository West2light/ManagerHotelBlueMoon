package KTPM.example.BlueMoon.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Table(name = "nop_tien")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Pay {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "khoanthuid")
    private Khoanthu khoanthu;

    @ManyToOne
    @JoinColumn(name = "nhankhauid")
    private Nhankhau nhankhau;

    private Date ngaythu;
    private Float tien;
    private String nguoinop;
}
