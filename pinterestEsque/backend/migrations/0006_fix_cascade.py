from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0005_remove_board_unique_user_board_and_more'),  # Change this to your actual last migration
    ]

    operations = [
        migrations.RunSQL(
            """
            -- Pin To Board / Board FOREIGN  KEY
            ALTER TABLE backend_pintoboard
            DROP CONSTRAINT backend_pintoboard_board_id_2d1ade8e_fk_backend_board_id;

            ALTER TABLE backend_pintoboard
            ADD CONSTRAINT backend_pintoboard_board_id_2d1ade8e_fk_backend_board_id
            FOREIGN KEY (board_id) REFERENCES backend_board(id) ON DELETE CASCADE;


            -- Board / CustomUser FOREIGN  KEY
            ALTER TABLE backend_board
            DROP CONSTRAINT backend_board_user_id_35875aae_fk_backend_customuser_id;

            ALTER TABLE backend_board
            ADD CONSTRAINT backend_board_user_id_35875aae_fk_backend_customuser_id
            FOREIGN KEY (user_id) REFERENCES backend_customuser(id) ON DELETE CASCADE;

            -- FOLLOWS  / board FOREIGN  KEY
            ALTER TABLE backend_follows
            DROP CONSTRAINT backend_follows_board_id_5c360555_fk_backend_board_id;

            ALTER TABLE backend_follows
            ADD CONSTRAINT backend_follows_board_id_5c360555_fk_backend_board_id
            FOREIGN KEY (board_id) REFERENCES backend_board(id) ON DELETE CASCADE;

            -- FOLLOWS  / user  FOREIGN  KEY
            ALTER TABLE backend_follows
            DROP CONSTRAINT backend_follows_user_id_0c83c510_fk_backend_customuser_id;

            ALTER TABLE backend_follows
            ADD CONSTRAINT backend_follows_user_id_0c83c510_fk_backend_customuser_id
            FOREIGN KEY (user_id) REFERENCES backend_customuser(id) ON DELETE CASCADE;

            -- FOLLOWSTREAM  / user  FOREIGN  KEY
            ALTER TABLE backend_followstream
            DROP CONSTRAINT backend_followstream_user_id_5338a013_fk_backend_customuser_id;

            ALTER TABLE backend_followstream
            ADD CONSTRAINT backend_followstream_user_id_5338a013_fk_backend_customuser_id
            FOREIGN KEY (user_id) REFERENCES backend_customuser(id) ON DELETE CASCADE;

            -- friends 1 / user  FOREIGN  KEY
            ALTER TABLE backend_friends
            DROP CONSTRAINT backend_friends_user1_id_69ae6e80_fk_backend_customuser_id;

            ALTER TABLE backend_friends
            ADD CONSTRAINT backend_friends_user1_id_69ae6e80_fk_backend_customuser_id
            FOREIGN KEY (user1_id) REFERENCES backend_customuser(id) ON DELETE CASCADE;

            -- friends 2 / user  FOREIGN  KEY
            ALTER TABLE backend_friends
            DROP CONSTRAINT backend_friends_user2_id_1af8dc95_fk_backend_customuser_id;

            ALTER TABLE backend_friends
            ADD CONSTRAINT backend_friends_user2_id_1af8dc95_fk_backend_customuser_id
            FOREIGN KEY (user2_id) REFERENCES backend_customuser(id) ON DELETE CASCADE;

            -- pin / user  FOREIGN  KEY
            ALTER TABLE backend_pin
            DROP CONSTRAINT backend_pin_user_id_cafa9d6f_fk_backend_customuser_id;

            ALTER TABLE backend_pin
            ADD CONSTRAINT backend_pin_user_id_cafa9d6f_fk_backend_customuser_id
            FOREIGN KEY (user_id) REFERENCES backend_customuser(id) ON DELETE CASCADE;

            -- likes / user  FOREIGN  KEY
            ALTER TABLE backend_likes
            DROP CONSTRAINT backend_likes_user_id_65d07ddf_fk_backend_customuser_id;

            ALTER TABLE backend_likes
            ADD CONSTRAINT backend_likes_user_id_65d07ddf_fk_backend_customuser_id
            FOREIGN KEY (user_id) REFERENCES backend_customuser(id) ON DELETE CASCADE;

            -- likes / pin  FOREIGN  KEY
            ALTER TABLE backend_likes
            DROP CONSTRAINT backend_likes_pin_id_7262341c_fk_backend_pin_id;

            ALTER TABLE backend_likes
            ADD CONSTRAINT backend_likes_pin_id_7262341c_fk_backend_pin_id
            FOREIGN KEY (pin_id) REFERENCES backend_pin(id) ON DELETE CASCADE;

            -- comment / user  FOREIGN  KEY
            ALTER TABLE backend_comment
            DROP CONSTRAINT backend_comment_user_id_1ab394ea_fk_backend_customuser_id;

            ALTER TABLE backend_comment
            ADD CONSTRAINT backend_comment_user_id_1ab394ea_fk_backend_customuser_id
            FOREIGN KEY (user_id) REFERENCES backend_customuser(id) ON DELETE CASCADE;

            -- comment / pin FOREIGN  KEY
            ALTER TABLE backend_comment
            DROP CONSTRAINT backend_comment_pin_id_34f0954f_fk_backend_pin_id;

            ALTER TABLE backend_comment
            ADD CONSTRAINT backend_comment_pin_id_34f0954f_fk_backend_pin_id
            FOREIGN KEY (pin_id) REFERENCES backend_pin(id) ON DELETE CASCADE;

            -- pintoboard/ board FOREIGN  KEY
            ALTER TABLE backend_pintoboard
            DROP CONSTRAINT backend_pintoboard_board_id_2d1ade8e_fk_backend_board_id;

            ALTER TABLE backend_pintoboard
            ADD CONSTRAINT backend_pintoboard_board_id_2d1ade8e_fk_backend_board_id
            FOREIGN KEY (board_id) REFERENCES backend_board(id) ON DELETE CASCADE;

            -- pintoboard/ pin FOREIGN  KEY
            ALTER TABLE backend_pintoboard
            DROP CONSTRAINT backend_pintoboard_pin_id_05b6553d_fk_backend_pin_id;

            ALTER TABLE backend_pintoboard
            ADD CONSTRAINT backend_pintoboard_pin_id_05b6553d_fk_backend_pin_id
            FOREIGN KEY (pin_id) REFERENCES backend_pin(id) ON DELETE CASCADE;

            -- requestee/ user FOREIGN  KEY
            ALTER TABLE backend_requests
            DROP CONSTRAINT backend_requests_requestee_id_6f9e0540_fk_backend_customuser_id;

            ALTER TABLE backend_requests
            ADD CONSTRAINT backend_requests_requestee_id_6f9e0540_fk_backend_customuser_id
            FOREIGN KEY (requestee_id) REFERENCES backend_customuser(id) ON DELETE CASCADE;

            -- requester/ user FOREIGN  KEY
            ALTER TABLE backend_requests
            DROP CONSTRAINT backend_requests_requester_id_09551f23_fk_backend_customuser_id;

            ALTER TABLE backend_requests
            ADD CONSTRAINT backend_requests_requester_id_09551f23_fk_backend_customuser_id
            FOREIGN KEY (requester_id) REFERENCES backend_customuser(id) ON DELETE CASCADE;

            -- streams/ board FOREIGN  KEY
            ALTER TABLE backend_streams
            DROP CONSTRAINT backend_streams_board_id_912a9e46_fk_backend_board_id;

            ALTER TABLE backend_streams
            ADD CONSTRAINT backend_streams_board_id_912a9e46_fk_backend_board_id
            FOREIGN KEY (board_id) REFERENCES backend_board(id) ON DELETE CASCADE;

            -- tag/ pin FOREIGN  KEY
            ALTER TABLE backend_tag
            DROP CONSTRAINT backend_tag_pin_id_66f3ba56_fk_backend_pin_id;

            ALTER TABLE backend_tag
            ADD CONSTRAINT backend_tag_pin_id_66f3ba56_fk_backend_pin_id
            FOREIGN KEY (pin_id) REFERENCES backend_pin(id) ON DELETE CASCADE;

            -- comment/ board FOREIGN  KEY
            ALTER TABLE backend_comment
            DROP CONSTRAINT backend_comment_board_id_fab5a289_fk_backend_board_id;

            ALTER TABLE backend_comment
            ADD CONSTRAINT backend_comment_board_id_fab5a289_fk_backend_board_id
            FOREIGN KEY (board_id) REFERENCES backend_board(id) ON DELETE CASCADE;

            -- streams/ followsttreaam FOREIGN  KEY
            ALTER TABLE backend_streams
            DROP CONSTRAINT backend_streams_followstream_id_2197ea6c_fk_backend_f;

            ALTER TABLE backend_streams
            ADD CONSTRAINT backend_streams_followstream_id_2197ea6c_fk_backend_f
            FOREIGN KEY (followstream_id) REFERENCES backend_followstream(id) ON DELETE CASCADE;

            """
        )
    ]
