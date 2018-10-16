---
layout: page
permalink: /curriculum/
---

## Professional Career

{% for job in site.jobs reversed %}
### <u>{{ job.position }}</u>
#### {{ job.organization }}
<small>{{ job.start_date }} - {{ job.end_date }} ({{ job.duration }})</small>  
<small>{{ job.location }}</small>
{{ job.content }}
<br>
{% endfor %}