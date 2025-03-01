package com.likelion.attserver.Repository;

import com.likelion.attserver.DTO.UserDTO;
import com.likelion.attserver.Entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    @Query("select new com.likelion.attserver.DTO.UserDTO(u.id, u.name, u.role) from UserEntity u where u.role = :role")
    List<UserDTO> findByRole(UserEntity.Role role);
}