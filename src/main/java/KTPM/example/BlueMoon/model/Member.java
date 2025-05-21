package KTPM.example.BlueMoon.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Data
@Table(name = "thanhvienho")
@AllArgsConstructor
@NoArgsConstructor
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @ManyToOne
    @JoinColumn(name = "hokhau_id")
    private hokhau hokhau;

    @ManyToOne
    @JoinColumn(name = "nhankhau_id")
    private nhankhau nhankhau;

    private Date ngaythem;
    private String quanhevoichuho;
}
