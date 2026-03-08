-- Make user admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('f0f0bde2-0b6f-44d4-a0fa-5b12edddac05', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

SELECT 'User is now an admin!' as status;
