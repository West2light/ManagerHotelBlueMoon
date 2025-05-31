package KTPM.example.BlueMoon.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Entity
@Table(name = "hokhau")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Hokhau {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int hokhauid;
    private int sothanhvien;
    private String sonha;
    private String duong;
    private String phuong;
    private String quan;
    private Date ngaylamhokhau;
    private String tenchuho;
    private int xemay;
    private int oto;
    private Double dientich;

    @OneToMany(mappedBy = "hokhau")
    private List<Lichsuthaydoi> members;

    @OneToMany(mappedBy = "hokhau")
    private List<Nhankhau> nhankhaus;

}
