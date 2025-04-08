package com.likelion.attserver.Repository;

import com.likelion.attserver.Entity.DocsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocsRepository extends JpaRepository<DocsEntity, Long> {
    List<DocsEntity> findByTeamId(Long teamId);
    boolean existsByTeamId(Long teamId);
}
