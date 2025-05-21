package KTPM.example.BlueMoon.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Entity
@Table(name = "hokhau")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class hokhau {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private int sothanhvien;
    private String sonha;
    private String duong;
    private String phuong;
    private String quan;
    private Date ngaycap;

    @OneToMany(mappedBy = "hokhau")
    private List<Member> members;

    @ManyToOne
    @JoinColumn(name = "chuho_id")
    private nhankhau nhankhau;
}
