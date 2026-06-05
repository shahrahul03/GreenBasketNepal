package com.greenbasket.nepal.domain.category.repository;

import com.greenbasket.nepal.domain.category.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findBySlug(String slug);

    boolean existsByName(String name);

    List<Category> findByIsActiveTrueOrderByDisplayOrderAsc();

    long countByIsActiveTrue();
}
