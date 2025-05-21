package KTPM.example.BlueMoon.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Entity
@Table(name = "khoanthu")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class khoanthu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private Date ngaytao;
    private Date thoihan;
    private String tenkhoanthu;
    private int tinhchat;
    private String note;

    @OneToMany(mappedBy = "khoanthu")
    private List<Pay> pays;
}
