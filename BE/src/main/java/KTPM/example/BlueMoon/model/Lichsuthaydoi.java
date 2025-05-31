package KTPM.example.BlueMoon.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Date;


@Entity
@Data
@Table(name = "lichsuthaydoihokhau")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Lichsuthaydoi {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "hokhauid")
    private Hokhau hokhau;

    @ManyToOne
    @JoinColumn(name = "nhankhauid")
    private Nhankhau nhankhau;

    private Date thoigian;
    private int loaithaydoi;
    private String quanhevoichuho;
}
