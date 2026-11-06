#!/usr/bin/perl
# SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
# SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

# Replaces the main log format of the nginx.conf AlmaLinux installs with one that has no client address. A file
# whose format was already replaced is left as it is.
use strict;
use warnings;

my $path = '/etc/nginx/nginx.conf';
open(my $in, '<', $path) or die "read $path: $!";
local $/;
my $text = <$in>;
close($in);

my $old = <<'OLD';
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';
OLD

my $new = <<'NEW';
    # No client address: Progmasoft keeps IP addresses only with ViGet uploads
    # (https://progmasoft.com/privacy).
    log_format  main  '[$time_local] "$host" "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent"';
NEW

exit 0 if index($text, $new) >= 0;
my $at = index($text, $old);
die "the main log format was not found\n" if $at < 0;
substr($text, $at, length($old)) = $new;

open(my $out, '>', $path) or die "write $path: $!";
print $out $text;
close($out);
