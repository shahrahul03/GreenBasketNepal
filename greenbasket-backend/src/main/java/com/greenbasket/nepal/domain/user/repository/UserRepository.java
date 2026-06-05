package com.greenbasket.nepal.domain.user.repository;

import com.greenbasket.nepal.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByEmailAndIsActiveTrue(String email);

    @Modifying
    @Query("UPDATE User u SET u.failedLoginAttempts = u.failedLoginAttempts + 1 WHERE u.id = :userId")
    int incrementFailedAttempts(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE User u SET u.failedLoginAttempts = 0, u.isLocked = false WHERE u.id = :userId")
    void unlockAccount(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE User u SET u.deletedAt = CURRENT_TIMESTAMP, u.isActive = false WHERE u.id = :userId")
    void softDelete(@Param("userId") Long userId);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role.name = :roleName AND u.deletedAt IS NULL")
    long countByRoleName(@Param("roleName") String roleName);

    @Query("SELECT FUNCTION('DATE_FORMAT', u.createdAt, '%Y-%m') as month, COUNT(u) FROM User u " +
           "WHERE u.deletedAt IS NULL GROUP BY FUNCTION('DATE_FORMAT', u.createdAt, '%Y-%m') ORDER BY month")
    List<Object[]> getUserGrowthByMonth();

    List<User> findTop10ByOrderByCreatedAtDesc();
}
