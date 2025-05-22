package KTPM.example.BlueMoon.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tamtrutamvang")
@Builder
public class Tamtrutamvang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @ManyToOne
    @JoinColumn(name = "nhankhauid")
    private Nhankhau nhankhau;

    private String trangthai;
    private String diachitamtrutamvang;
    private Date thoigian;
    private String noidungdenghi;
}
