export const  systemRoles = {
    USER : 'Buyer',
    ADMIN : "Admin"
};

const {USER, ADMIN} = systemRoles;
export const  roles = {
    USER_ROLE : USER,
    ADMIN_ROLE : ADMIN,
    USER_ADMIN_ROLE : [USER, ADMIN]
};